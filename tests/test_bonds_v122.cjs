// 1.2.2 bond system: XP from interactions (daily/weekly limits), rising XP per rank × pace, cooldown, bond events (scripted or the
// default theme), romance gate, the narrator's view in the Now entry, the UI, and the lorebook importer.
const fs = require('fs'), path = require('path'), ejs = require('ejs'), { execFileSync } = require('child_process');
const { Schema, initState, applyPatch, ok, ROOT } = require('./harness.cjs');
global.window = { parent: { document: {} } };
const U = new Function(fs.readFileSync(path.join(ROOT, 'src/scripts/ui.js'), 'utf8') + '\nreturn { PANELS, view, renderProfile, DATA, bondNeed };')();
const BR = JSON.parse(fs.readFileSync(path.join(ROOT, 'data/bond_rules.json'), 'utf8'));
console.log('Bonds 1.2.2');

const IA = (With, Kind, Gift) => ({ op: 'insert', path: '/Interactions/-', value: Gift ? { With, Kind, Gift } : { With, Kind } });
const T = (S, time, extra = []) => applyPatch(S, [{ op: 'replace', path: '/World/Time', value: time }, ...extra]);
const nextDay = (S, day, extra = []) => applyPatch(S, [{ op: 'replace', path: '/World/Day', value: day }, { op: 'replace', path: '/World/Time', value: '12:00' }, ...extra]);
let S = initState();
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
A = nextDay(A, 'Thu', [IA('Trixie', 'talk')]);
ok(A.Bonds.Trixie.$xp === 10, 'XP stops at the full bar until the event');
ok(A.$ui.bev.Trixie && A.$ui.bev.Trixie.ready && A.$ui.toasts.length >= 0, 'the engine lists the ready event for the UI and the Now entry');

// ---- the AI cannot write engine fields; a rank rises only through a ready event
const W = applyPatch(S, [{ op: 'replace', path: '/Bonds/Trixie', value: { Rank: 0, Trust: 60, $xp: 99, _Event_ready: true } }]);
ok(W.Bonds.Trixie.$xp === 0 && !W.Bonds.Trixie._Event_ready && W.Bonds.Trixie.Trust === 60, 'a rewritten bond record cannot set XP or event-ready');
const R0 = applyPatch(S, [{ op: 'replace', path: '/Bonds/Trixie/Rank', value: 1 }]);
ok(R0.Bonds.Trixie.Rank === 0 && R0._Log.some(l => /reverted/.test(l)), 'rank up without a ready event is reverted');
let R1 = applyPatch(A, [{ op: 'replace', path: '/Bonds/Trixie/Rank', value: 1 }, { op: 'insert', path: '/Bonds/Trixie/Milestones/-', value: 'first real talk' }]);
ok(R1.Bonds.Trixie.Rank === 1 && R1.Bonds.Trixie.$xp === 0 && !R1.Bonds.Trixie._Event_ready, 'the event raises the rank by 1 and empties the bar');
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

// ---- events: default theme when present; scripted conditions (engine with a sample event)
ok(A.$ui.bev.Trixie.now && A.$ui.bev.Trixie.dir === BR.themes['0'] && !A.$ui.bev.Trixie.s, 'no scripted event: the default theme for the rank, when they are present');
const away = applyPatch(A, [{ op: 'replace', path: '/Scene/Present', value: {} }]);
ok(away.$ui.bev.Trixie.ready && !away.$ui.bev.Trixie.now, 'not present: ready, but not now');
const src = fs.readFileSync(path.join(ROOT, 'src/scripts/engine.js'), 'utf8');
const EV = [{ npc: 'Trixie', rank: 0, where: ['Club Rooms'], time: ['16:00', '20:00'], days: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri'], not_sky: [], requires: {}, text: 'Directions:\n- She rehearses.\n- Must: she asks for help.' }];
const runE = new Function(src.replace(/const BEV = \[[^\n]*\];/, 'const BEV = ' + JSON.stringify(EV) + ';') + '\nreturn runEngine;')();
const step = (B0, ops) => { const X = _.cloneDeep(B0); for (const o of ops) _.set(X, o.path.slice(1).split('/'), o.value); const P = Schema.parse(X); runE(P, B0, ''); return Schema.parse(P); };
const E1 = step(A, [{ path: '/World/Time', value: '13:00' }]);
ok(E1.$ui.bev.Trixie.s && !E1.$ui.bev.Trixie.now && E1.$ui.bev.Trixie.where === 'Club Rooms' && /Mon\/Tue/.test(E1.$ui.bev.Trixie.when), 'scripted event: where / when shown, not now outside its place and time');
const E2 = step(A, [{ path: '/World/Time', value: '17:00' }, { path: '/World/Location', value: 'Club Rooms' }]);
ok(E2.$ui.bev.Trixie.now && /Must: she asks for help/.test(E2.$ui.bev.Trixie.dir), 'scripted event: at the place and time with her present → its directions');
const E3 = step(A, [{ path: '/World/Time', value: '17:00' }, { path: '/World/Location', value: 'Club Rooms' }, { path: '/World/Day', value: 'Sat' }]);
ok(!E3.$ui.bev.Trixie.now, 'scripted event: wrong day → not now');

// ---- the Now entry: what she shares (open: +2), the perk line, the event block
const now505 = fs.readFileSync(path.join(ROOT, 'src/worldbook/custom/content/505.txt'), 'utf8');
const gv = St => k => _.get({ stat_data: St }, k);
const n1 = ejs.render(now505, { getvar: gv(R1) });
ok(/Bond: Trixie \(Rank 1, open\): shares [^\n]*likes, dislikes and hobbies/.test(n1) && /Not yet: their personality/.test(n1) && /At this rank: greets/.test(n1), 'Now: an open NPC at Rank 1 shares up to Rank 3 topics; the next tier is deflected');
const n0 = ejs.render(now505, { getvar: gv(A) });
ok(/Bond event available with Trixie \(Rank 0 → 1\)/.test(n0) && n0.includes(BR.themes['0']) && /raise \/Bonds\/Trixie\/Rank by 1/.test(n0), 'Now: a ready event present in the scene gives its directions and how to close it');
const Ir = T(S, '12:50', [{ op: 'replace', path: '/Scene/Present', value: { Irene: { Note: '' } } }]);
const ni = ejs.render(now505, { getvar: gv(Ir) });
ok(/Bond: Irene \(Rank 0, guarded\): shares how they look and their public role\. Not yet: their name/.test(ni), 'Now: a guarded NPC at Rank 0 shares only the public tier');

// ---- UI
U.view.ptab = 'bonds'; let h = U.PANELS.people.render(A);
ok(/10\/10 XP/.test(h) && /bond event ready/.test(h), 'People: XP bar and the ready badge');
U.view.arg = 'Trixie'; h = U.PANELS.npc.render(R1);
ok(/0\/20 XP/.test(h) && /event can start in 1 day|fills the bar/.test(h), 'dossier: XP toward the next rank');
U.view.tab = 'settings'; h = U.renderProfile(R1);
ok(/data-act="bondset" data-f="bondpace" data-v="fast"/.test(h) && /data-f="romrank" data-v="8" class="on"/.test(h), 'Settings: bond pace and romance rank');

// ---- the lorebook importer
const out = execFileSync('python3', [path.join(ROOT, 'tools/import_bond_events.py'), '--check', path.join(ROOT, 'docs/examples/bond_events_example.txt')], { encoding: 'utf8' });
ok(/2 bond events: Irene 0→1, Trixie 4→5/.test(out), 'importer parses the example lorebook');
let bad = ''; try { execFileSync('python3', [path.join(ROOT, 'tools/import_bond_events.py'), '--check', '-'], { input: '', encoding: 'utf8', stdio: 'pipe' }); } catch (e) { bad = String(e.stderr || e.message); }
ok(!!bad, 'importer refuses a missing file');
