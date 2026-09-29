// Bond XP from interactions, daily/weekly limits, rising XP per rank, cooldown, and automatic progression.
const fs = require('fs'), path = require('path'), ejs = require('ejs'), { execFileSync } = require('child_process');
const { Schema, initState: initBase, applyPatch, ok, ROOT } = require('./harness.cjs');
// Isolate the original system's numeric rules from optional mood and sleep modifiers.
const initState = opts => { const S = initBase(opts); S.$ui.wxfx = 'off'; return S; };
global.window = { parent: { document: {} } };
const U = new Function(fs.readFileSync(path.join(ROOT, 'src/scripts/ui.js'), 'utf8') + '\nreturn { PANELS, view, renderProfile, DATA, bondNeed };')();
const BR = JSON.parse(fs.readFileSync(path.join(ROOT, 'data/bond_rules.json'), 'utf8'));
console.log('Bonds 1.2.2');

const IA = (With, Kind, Gift) => ({ op: 'insert', path: '/Interactions/-', value: Gift ? { With, Kind, Gift } : { With, Kind } });
const T = (S, time, extra = []) => applyPatch(S, [{ op: 'replace', path: '/World/Time', value: time }, ...extra]);
const nextDay = (S, day, extra = []) => applyPatch(S, [{ op: 'replace', path: '/World/Day', value: day }, { op: 'replace', path: '/World/Time', value: '12:00' }, ...extra]);
let S = initState({ etnie: true });
S = T(S, '12:00', [{ op: 'replace', path: '/World/Location', value: 'Courtyards' }, { op: 'replace', path: '/Scene/Present', value: { Trixie: { Note: 'juggling' } } }]);
ok(S.Bonds.Trixie && S.Bonds.Trixie.Rank === 0 && S.Bonds.Trixie.$xp === 0 && S.$eng.bondv === 2, 'meeting starts a bond at Rank 0, XP 0');
ok(S.Interactions.length === 0, 'Interactions start empty');

// ---- XP per kind, daily limits
let A = T(S, '12:30', [IA('Trixie', 'talk'), IA('Trixie', 'hangout')]);
ok(A.Bonds.Trixie.$xp === 5 && A.Interactions.length === 0, `talk + hangout = 5 XP, list emptied (${A.Bonds.Trixie.$xp})`);
A = T(A, '13:00', [IA('Trixie', 'talk'), IA('Trixie', 'hangout')]);
ok(A.Bonds.Trixie.$xp === 5, 'a second talk and hangout the same day add nothing');
A = nextDay(A, 'Tue', [IA('trixie', 'Talk')]);
ok(A.Bonds.Trixie.$xp === 7, 'next day counts again (names and kinds are matched loosely)');
// bar stops when full: Rank 0 needs 10 at standard pace
A = nextDay(A, 'Wed', [IA('Trixie', 'talk'), IA('Trixie', 'hangout')]);
ok(A.Bonds.Trixie.$xp === 10 && A.Bonds.Trixie._Event_ready, `full bar (10) opens the event (${A.Bonds.Trixie.$xp})`);
A = nextDay(A, 'Thu');
ok(A.Bonds.Trixie.$xp === 10 && A.Bonds.Trixie.Rank === 0, 'full XP waits for a genuine encounter');
ok(!Object.keys(A.$ui.bev || {}).length, 'no scripted event is offered');

// ---- the AI cannot write engine fields; a rank rises only through a ready event
const W = applyPatch(S, [{ op: 'replace', path: '/Bonds/Trixie', value: { Rank: 0, Trust: 60, $xp: 99, _Event_ready: true } }]);
ok(W.Bonds.Trixie.$xp === 0 && !W.Bonds.Trixie._Event_ready && W.Bonds.Trixie.Trust === 60, 'a rewritten bond record cannot set XP or event-ready');
const R0 = applyPatch(S, [{ op: 'replace', path: '/Bonds/Trixie/Rank', value: 1 }]);
ok(R0.Bonds.Trixie.Rank === 0 && R0._Log.some(l => /reverted/.test(l)), 'rank up without a ready event is reverted');
let R1 = applyPatch(A, [IA('Trixie', 'talk')]);
ok(R1.Bonds.Trixie.Rank === 1 && R1.Bonds.Trixie.$xp === 2 && !R1.Bonds.Trixie._Event_ready, 'the next genuine interaction raises one rank');
ok(R1.Bonds.Trixie.$cool === Math.floor(R1.$eng.abs / 1440) + BR.cool_base[1], `cooldown after the rank (${BR.cool_base[1]} day at standard pace)`);

// ---- gifts: twice a week, loved counts more from Rank 3, disliked raises Tension; help once a week
let G = JSON.parse(JSON.stringify(R1)); G.Bonds.Trixie.Rank = 3; G.Bonds.Trixie.$xp = 0;
G = nextDay(G, 'Fri', [IA('Trixie', 'gift', 'loved')]);
ok(G.Bonds.Trixie.$xp === Math.round(BR.gift_xp.loved * BR.gift_bonus_mult), `loved gift at Rank 3: ${G.Bonds.Trixie.$xp} XP`);
const t0 = G.Bonds.Trixie.Tension;
G = T(G, '14:00', [IA('Trixie', 'gift', 'disliked')]);
ok(G.Bonds.Trixie.Tension === t0 + BR.gift_disliked_tension, 'a disliked gift raises Tension');
const xg = G.Bonds.Trixie.$xp;
G = T(G, '15:00', [IA('Trixie', 'gift', 'loved')]);
ok(G.Bonds.Trixie.$xp === xg && G._Log.some(l => /gifts this week/.test(l)), 'a third gift in a week adds nothing (and the log says why)');
G = T(G, '16:00', [IA('Trixie', 'help'), IA('Trixie', 'help')]);
ok(G.Bonds.Trixie.$xp === xg + BR.kind_xp.help, 'help counts once a week');

// ---- a raised Progress (old habit) still counts once
const L = T(S, '12:40', [{ op: 'replace', path: '/Bonds/Trixie/Progress', value: 2 }]);
ok(L.Bonds.Trixie.$xp === BR.kind_xp.hangout && L.Bonds.Trixie.Progress === 0, 'Progress +2 without Interactions counts as a hangout; Progress stays 0');

// ---- migration of a pre-1.2.2 save: Progress becomes XP once
const M0 = JSON.parse(JSON.stringify(S)); M0.$eng.bondv = 0; M0.Bonds.Etnie.Progress = 5;
const M1 = T(M0, '12:05');
ok(M1.Bonds.Etnie.$xp === Math.round(0.5 * BR.xp_base[3]) && M1.Bonds.Etnie.Progress === 0 && M1.$eng.bondv === 2, `old Progress 5/10 at Rank 3 → ${M1.Bonds.Etnie.$xp} XP`);

// ---- pace
const F = applyPatch(S, [{ op: 'replace', path: '/$ui/bondpace', value: 'fast' }]);
ok(U.bondNeed(F, 0) === Math.max(3, Math.round(10 * BR.pace.fast)) && U.bondNeed(S, 9) === 80 && U.bondNeed(applyPatch(S, [{ op: 'replace', path: '/$ui/bondpace', value: 'slow' }]), 9) === 200, 'pace scales the XP per rank (fast / standard / slow)');
let Fx = T(F, '12:30', [IA('Trixie', 'talk'), IA('Trixie', 'hangout')]);
ok(Fx.Bonds.Trixie._Event_ready, 'on fast pace one afternoon together fills Rank 0');

// ---- romance gate (default Rank 8; Settings: any / off)
const Ro = applyPatch(R1, [{ op: 'replace', path: '/Bonds/Trixie/Romance', value: true }]);
ok(!Ro.Bonds.Trixie.Romance && Ro._Log.some(l => /opens at Rank 8/.test(l)), 'romance waits for Rank 8 by default');
const RoAny = applyPatch(applyPatch(R1, [{ op: 'replace', path: '/$ui/romrank', value: 0 }]), [{ op: 'replace', path: '/Bonds/Trixie/Romance', value: true }]);
ok(RoAny.Bonds.Trixie.Romance, 'Settings "any rank": allowed');
const RoOff = applyPatch(applyPatch(R1, [{ op: 'replace', path: '/$ui/romrank', value: 11 }]), [{ op: 'replace', path: '/Bonds/Trixie/Romance', value: true }]);
ok(!RoOff.Bonds.Trixie.Romance, 'Settings "off": never');

// ---- full XP is held safely while the NPC is away
const away = applyPatch(A, [{ op: 'replace', path: '/Scene/Present', value: {} }]);
ok(away.Bonds.Trixie.Rank === 0 && away.Bonds.Trixie.$xp === 10, 'an absent NPC cannot advance the bond');

// ---- the Now entry: what she shares (open: +2), the perk line, the event block
const now505 = fs.readFileSync(path.join(ROOT, 'src/worldbook/custom/content/505.txt'), 'utf8');
const gv = St => k => _.get({ stat_data: St }, k);
const n1 = ejs.render(now505, { getvar: gv(R1) });
ok(/Bond: Trixie \(Rank 1, open, Trust 63 neutral\): shares [^\n]*likes, dislikes, hobbies and birthday/.test(n1) && /Not yet: their personality/.test(n1) && /At this rank: greets/.test(n1), 'Now: an open NPC at Rank 1 shares up to Rank 3 topics; the next tier is deflected');
const n0 = ejs.render(now505, { getvar: gv(A) });
ok(!/Bond event available|raise \/Bonds\/Trixie\/Rank by 1/.test(n0), 'Now: no rank-up event or manual rank instruction');
const Ir = T(S, '12:50', [{ op: 'replace', path: '/Scene/Present', value: { Irene: { Note: '' } } }]);
const ni = ejs.render(now505, { getvar: gv(Ir) });
ok(/Bond: Irene \(Rank 0, guarded, Trust 40 neutral\): shares how they look and their public role\. Not yet: their name/.test(ni), 'Now: a guarded NPC at Rank 0 shares only the public tier');

// ---- UI
U.view.ptab = 'bonds'; let h = U.PANELS.people.render(A);
ok(/10\/10 XP/.test(h) && !/bond event ready/.test(h), 'People: XP bar without an event badge');
U.view.arg = 'Trixie'; h = U.PANELS.npc.render(R1);
ok(/2\/20 XP/.test(h) && /fills the bar/.test(h), 'dossier: XP toward the next rank');
U.view.tab = 'settings'; h = U.renderProfile(R1);
ok(/data-act="bondset" data-f="bondpace" data-v="fast"/.test(h) && /data-f="romrank" data-v="8" class="on"/.test(h), 'Settings: bond pace and romance rank');

